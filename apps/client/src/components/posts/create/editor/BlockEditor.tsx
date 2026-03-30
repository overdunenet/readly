import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  TextAlignButton,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from '@blocknote/react';
import { memo, useCallback, useEffect, useRef } from 'react';

import { schema, insertDividerItem } from './schema';

interface BlockEditorProps {
  value: string;
  onChange: (html: string) => void;
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

const ALLOWED_SLASH_ITEMS = new Set([
  'Paragraph',
  'Heading',
  'Heading 2',
  'Heading 3',
  'Image',
]);

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
      <FileReplaceButton />
    </FormattingToolbar>
  );
}

function useDirectFileUpload(editor: ReturnType<typeof useCreateBlockNote>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetBlockIdRef = useRef<string | null>(null);

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      const blockId = targetBlockIdRef.current;
      if (!file || !blockId) return;

      const dataUrl = await uploadFile(file);
      editor.updateBlock(blockId, {
        props: { url: dataUrl, name: file.name } as Record<string, string>,
      });
      input.value = '';
      targetBlockIdRef.current = null;
    });
    document.body.appendChild(input);
    fileInputRef.current = input;

    return () => {
      document.body.removeChild(input);
    };
  }, [editor]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const addButton = target.closest('.bn-add-file-button');
      if (!addButton) return;

      const blockOuter = addButton.closest('.bn-block-outer');
      const blockId = blockOuter?.getAttribute('data-id');
      if (!blockId || !fileInputRef.current) return;

      e.preventDefault();
      e.stopPropagation();
      targetBlockIdRef.current = blockId;
      fileInputRef.current.click();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);
}

function BlockEditorInner({ value, onChange, placeholder }: BlockEditorProps) {
  const initialLoadedRef = useRef(false);

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

  useDirectFileUpload(editor);

  useEffect(() => {
    if (!initialLoadedRef.current && value) {
      initialLoadedRef.current = true;

      const blocks = editor.tryParseHTMLToBlocks(value);
      if (blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
      }
    }
  }, [editor, value]);

  const handleChange = useCallback(() => {
    const html = editor.blocksToHTMLLossy(editor.document);
    onChange(html);
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
  );
}

export const BlockEditor = memo(BlockEditorInner);
