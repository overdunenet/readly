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
import { memo, useCallback, useEffect, useRef } from 'react';

import { schema, insertDividerItem } from './schema';

interface BlockEditorProps {
  freeContent: string;
  paidContent: string | null;
  onChange: (freeContent: string, paidContent: string | null) => void;
  placeholder?: string;
}

function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
    if (!initialLoadedRef.current && (freeContent || paidContent)) {
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
      if (allBlocks.length > 0) {
        editor.replaceBlocks(editor.document, allBlocks);
      }
    }
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
