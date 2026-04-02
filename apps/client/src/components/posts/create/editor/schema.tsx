import {
  BlockNoteSchema,
  defaultBlockSpecs,
  insertOrUpdateBlockForSlashMenu,
} from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { Lock } from 'lucide-react';

import type { DefaultReactSuggestionItem } from '@blocknote/react';

const PaywallDividerBlock = createReactBlockSpec(
  {
    type: 'paywallDivider' as const,
    propSchema: {},
    content: 'none',
  },
  {
    render: () => (
      <div className="flex items-center gap-3 my-4 px-2 py-3 bg-amber-50 rounded-lg select-none">
        <div className="flex-1 border-t border-dashed border-amber-400" />
        <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium whitespace-nowrap">
          <Lock size={14} />
          <span>여기부터 유료 구간입니다</span>
        </div>
        <div className="flex-1 border-t border-dashed border-amber-400" />
      </div>
    ),
    toExternalHTML: () => <div data-paywall-divider="true" />,
    parse: (element) => {
      if (
        element instanceof HTMLElement &&
        element.dataset.paywallDivider === 'true'
      ) {
        return {};
      }
      return undefined;
    },
  },
);

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
    paywallDivider: PaywallDividerBlock(),
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
