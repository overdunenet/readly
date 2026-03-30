import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FilePanelController,
  FilePanel,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
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

function UploadOnlyFilePanel(props: { blockId: string }) {
  return (
    <FilePanel {...props} tabs={[{ name: 'upload', tabPanel: undefined }]} />
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
      <FileReplaceButton />
    </FormattingToolbar>
  );
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
      <FilePanelController filePanel={UploadOnlyFilePanel} />
    </BlockNoteView>
  );
}

export const BlockEditor = memo(BlockEditorInner);
