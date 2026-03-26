import tw from 'tailwind-styled-components';

export const STATUS_FILTER_VALUES = {
  ALL: 'all',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
} as const;

export type StatusFilterValue =
  (typeof STATUS_FILTER_VALUES)[keyof typeof STATUS_FILTER_VALUES];

interface StatusFilterProps {
  selectedStatus: StatusFilterValue;
  onStatusChange: (status: StatusFilterValue) => void;
}

const FILTER_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: STATUS_FILTER_VALUES.ALL, label: '전체' },
  { value: STATUS_FILTER_VALUES.DRAFT, label: '임시저장' },
  { value: STATUS_FILTER_VALUES.PUBLISHED, label: '발행됨' },
  { value: STATUS_FILTER_VALUES.SCHEDULED, label: '예약' },
];

const StatusFilter = ({
  selectedStatus,
  onStatusChange,
}: StatusFilterProps) => (
  <Container>
    {FILTER_OPTIONS.map((option) => (
      <FilterTab
        key={option.value}
        $active={selectedStatus === option.value}
        onClick={() => onStatusChange(option.value)}
      >
        {option.label}
      </FilterTab>
    ))}
  </Container>
);

export default StatusFilter;

// Styled Components
const Container = tw.div`
  flex
  gap-1
  bg-gray-100
  rounded-lg
  p-1
`;

const FilterTab = tw.button<{ $active: boolean }>`
  px-3
  py-1.5
  rounded-md
  text-sm
  transition-colors
  flex-1
  ${({ $active }) =>
    $active
      ? 'bg-white text-gray-900 shadow-sm font-medium'
      : 'text-gray-600 hover:text-gray-900'}
`;
