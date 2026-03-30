import {
  BlockNoteSchema,
  defaultBlockSpecs,
  insertOrUpdateBlockForSlashMenu,
} from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';

import type { DefaultReactSuggestionItem } from '@blocknote/react';

const DividerBlock = createReactBlockSpec(
  {
    type: 'divider' as const,
    propSchema: {},
    content: 'none',
  },
  {
    render: () => <hr className="border-t border-gray-300 my-2 w-full" />,
    toExternalHTML: () => <hr />,
    parse: (element) => {
      if (element.tagName === 'HR') {
        return {};
      }
      return undefined;
    },
  },
);

const {
  audio: _audio,
  video: _video,
  file: _file,
  table: _table,
  checkListItem: _checkListItem,
  codeBlock: _codeBlock,
  ...remainingBlockSpecs
} = defaultBlockSpecs;

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...remainingBlockSpecs,
    divider: DividerBlock(),
  },
});

export type EditorSchema = typeof schema;

export function insertDividerItem(
  editor: typeof schema.BlockNoteEditor,
): DefaultReactSuggestionItem {
  return {
    title: '구분선',
    subtext: '구분선을 삽입합니다',
    onItemClick: () => {
      insertOrUpdateBlockForSlashMenu(editor, { type: 'divider' as const });
    },
    aliases: ['hr', 'divider', '구분선'],
    group: '기본 블록',
  };
}
