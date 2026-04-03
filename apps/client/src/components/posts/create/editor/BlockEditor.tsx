import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  TextAlignButton,
  getDefaultReactSlashMenuItems,
  useBlockNoteEditor,
  useCreateBlockNote,
  useSelectedBlocks,
} from '@blocknote/react';
import { createTRPCClient, httpLink } from '@trpc/client';
import { memo, useCallback, useEffect, useRef } from 'react';

import type { AppRouter } from '@readly/api-types/src/server';

import { useAuthStore } from '@/stores/auth';

import { schema, insertDividerItem } from './schema';

interface BlockEditorProps {
  freeContent: string;
  paidContent: string | null;
  onChange: (freeContent: string, paidContent: string | null) => void;
  placeholder?: string;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const uploadClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${apiUrl}/trpc`,
      headers() {
        const token = useAuthStore.getState().accessToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

async function uploadFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 50MB를 초과할 수 없습니다');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const key = `post/${crypto.randomUUID()}.${ext}`;

  const { presignedUrl, cdnUrl } =
    await uploadClient.upload.getPresignedUrl.mutate({
      key,
      contentType: file.type,
    });

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다');
  }

  return cdnUrl;
}

function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

const ALLOWED_SLASH_ITEMS = new Set([
  'Paragraph',
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Image',
]);

function DirectFileReplaceButton() {
  const editor = useBlockNoteEditor();
  const selectedBlocks = useSelectedBlocks(editor);

  const isFileBlock =
    selectedBlocks.length === 1 && selectedBlocks[0].type === 'image';

  if (!isFileBlock) return null;

  const handleClick = async () => {
    const file = await pickImageFile();
    if (!file) return;
    const dataUrl = await uploadFile(file);
    editor.updateBlock(selectedBlocks[0].id, {
      props: { url: dataUrl, name: file.name } as Record<string, string>,
    });
  };

  return (
    <button
      className="bn-file-replace-button"
      onClick={handleClick}
      title="이미지 교체"
    >
      교체
    </button>
  );
}

function CustomFormattingToolbar() {
  return (
    <FormattingToolbar>
      <BlockTypeSelect />
      <BasicTextStyleButton basicTextStyle="bold" />
      <BasicTextStyleButton basicTextStyle="italic" />
      <BasicTextStyleButton basicTextStyle="underline" />
      <BasicTextStyleButton basicTextStyle="strike" />
      <CreateLinkButton />
      <TextAlignButton textAlignment="left" />
      <TextAlignButton textAlignment="center" />
      <TextAlignButton textAlignment="right" />
      <DirectFileReplaceButton />
    </FormattingToolbar>
  );
}

function useDirectFileUpload(
  editor: ReturnType<typeof useCreateBlockNote>,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const handleClick = useCallback(
    async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const addButton = target.closest('.bn-add-file-button');
      if (!addButton) return;

      const blockOuter = addButton.closest('.bn-block-outer');
      const blockId = blockOuter?.getAttribute('data-id');
      if (!blockId) return;

      e.preventDefault();
      e.stopPropagation();

      const file = await pickImageFile();
      if (!file) return;

      const dataUrl = await uploadFile(file);
      editor.updateBlock(blockId, {
        props: { url: dataUrl, name: file.name } as Record<string, string>,
      });
    },
    [editor],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('click', handleClick, true);
    return () => container.removeEventListener('click', handleClick, true);
  }, [containerRef, handleClick]);
}

function BlockEditorInner({
  freeContent,
  paidContent,
  onChange,
  placeholder,
}: BlockEditorProps) {
  const initialLoadedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useCreateBlockNote(
    {
      schema,
      uploadFile,
      placeholders: {
        default: placeholder ?? '내용을 입력하세요',
      },
    },
    [],
  );

  useDirectFileUpload(editor, containerRef);

  useEffect(() => {
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;

    const freeBlocks = freeContent
      ? editor.tryParseHTMLToBlocks(freeContent)
      : [];
    const paywallDividerBlock = {
      type: 'paywallDivider' as const,
      props: {},
    };
    const paidBlocks = paidContent
      ? editor.tryParseHTMLToBlocks(paidContent)
      : [];

    const allBlocks = [...freeBlocks, paywallDividerBlock, ...paidBlocks];
    editor.replaceBlocks(editor.document, allBlocks);
  }, [editor, freeContent, paidContent]);

  const handleChange = useCallback(() => {
    const doc = editor.document;

    // 삭제 방지: paywallDivider가 없으면 마지막에 재삽입
    const paywallIndices = doc.reduce<number[]>((acc, block, idx) => {
      if (block.type === 'paywallDivider') acc.push(idx);
      return acc;
    }, []);

    if (paywallIndices.length === 0) {
      const lastBlock = doc[doc.length - 1];
      editor.insertBlocks(
        [{ type: 'paywallDivider' as const, props: {} }],
        lastBlock.id,
        'after',
      );
      return;
    }

    // paywallDivider가 2개 이상이면 첫 번째만 남기고 나머지 제거
    if (paywallIndices.length > 1) {
      const blocksToRemove = paywallIndices.slice(1).map((idx) => doc[idx].id);
      editor.removeBlocks(blocksToRemove);
      return;
    }

    const paywallIndex = paywallIndices[0];
    const freeBlocks = doc.slice(0, paywallIndex);
    const paidBlocks = doc.slice(paywallIndex + 1);

    const freeHtml = editor.blocksToHTMLLossy(freeBlocks);
    const paidHtml =
      paidBlocks.length > 0 ? editor.blocksToHTMLLossy(paidBlocks) : null;

    onChange(freeHtml, paidHtml);
  }, [editor, onChange]);

  const getSlashMenuItems = useCallback(
    async (query: string) =>
      filterSuggestionItems(
        [
          ...getDefaultReactSlashMenuItems(editor).filter((item) =>
            ALLOWED_SLASH_ITEMS.has(item.title),
          ),
          insertDividerItem(editor),
        ],
        query,
      ),
    [editor],
  );

  return (
    <div ref={containerRef}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        slashMenu={false}
        filePanel={false}
        formattingToolbar={false}
      >
        <FormattingToolbarController
          formattingToolbar={CustomFormattingToolbar}
        />
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
}

export const BlockEditor = memo(BlockEditorInner);
