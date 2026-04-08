import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { PUBLISH_ACCESS_LEVEL_OPTIONS } from '@/shared/constants/access-level';
import {
  BaseModal,
  ModalButtonGroup,
  ModalCancelButton,
  ModalConfirmButton,
} from '@/shared/modal/BaseModal';

const AGE_RATING_OPTIONS = [
  { value: 'all', label: '전체이용가' },
  { value: 'adult', label: '성인전용' },
] as const;

const publishSheetSchema = z.object({
  accessLevel: z.enum(['public', 'subscriber', 'purchaser']),
  price: z
    .number()
    .int()
    .min(0, '0 이상 입력해주세요')
    .max(100000, '100,000원 이하로 입력해주세요')
    .refine((v) => v === 0 || (v >= 100 && v % 100 === 0), {
      message: '100원 단위로 입력해주세요',
    }),
  ageRating: z.enum(['all', 'adult']),
});

export type PublishSheetResult = z.infer<typeof publishSheetSchema>;

interface PublishSheetProps {
  defaultValues?: Partial<PublishSheetResult>;
  isRepublish?: boolean;
}

const PublishSheet = ({
  defaultValues,
  isRepublish = false,
}: PublishSheetProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<PublishSheetResult>({
    resolver: zodResolver(publishSheetSchema),
    mode: 'onChange',
    defaultValues: {
      accessLevel: defaultValues?.accessLevel ?? 'public',
      price: defaultValues?.price ?? 0,
      ageRating: defaultValues?.ageRating ?? 'all',
    },
  });

  const accessLevel = watch('accessLevel');

  useEffect(() => {
    if (accessLevel === 'public') {
      setValue('price', 0);
    }
  }, [accessLevel, setValue]);

  const onSubmit = (data: PublishSheetResult) => {
    SnappyModal.close(data);
  };

  const handleCancel = () => {
    SnappyModal.close(null);
  };

  return (
    <BaseModal title="발행 설정" showCloseButton={false} maxWidth="sm">
      {isRepublish && (
        <RepublishBanner>
          <AlertCircle size={16} />
          <span>발행 버전과 다른 내용이 있습니다</span>
        </RepublishBanner>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label>접근 권한</Label>
          <Controller
            name="accessLevel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange}>
                {PUBLISH_ACCESS_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>연령 등급</Label>
          <Controller
            name="ageRating"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange}>
                {AGE_RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>가격</Label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                max={100000}
                step={100}
                disabled={accessLevel === 'public'}
                value={field.value === 0 ? '' : field.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(
                    e.target.value === ''
                      ? 0
                      : parseInt(e.target.value, 10) || 0,
                  )
                }
                onBlur={() => {
                  if (field.value === 0) field.onChange(0);
                }}
                placeholder="0"
              />
            )}
          />
          <HelpText>
            {accessLevel === 'public'
              ? '전체 공개 글은 무료입니다'
              : '100원 단위, 100~100,000원'}
          </HelpText>
        </FieldGroup>

        <ModalButtonGroup>
          <ModalCancelButton onClick={handleCancel} type="button">
            취소
          </ModalCancelButton>
          <ModalConfirmButton type="submit" disabled={!isValid}>
            발행
          </ModalConfirmButton>
        </ModalButtonGroup>
      </Form>
    </BaseModal>
  );
};

export default PublishSheet;

// Styled Components
const RepublishBanner = tw.div`
  flex
  items-center
  gap-2
  p-3
  mb-4
  bg-amber-50
  text-amber-700
  text-sm
  rounded-lg
  border
  border-amber-200
`;

const Form = tw.form`
  space-y-5
`;

const FieldGroup = tw.div`
  flex
  flex-col
  gap-1.5
`;

const Label = tw.label`
  text-sm
  font-medium
  text-gray-700
`;

const Select = tw.select`
  w-full
  px-3
  py-2.5
  border
  border-gray-300
  rounded-lg
  text-sm
  bg-white
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
`;

const Input = tw.input`
  w-full
  px-3
  py-2.5
  border
  border-gray-300
  rounded-lg
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
  disabled:bg-gray-100
  disabled:text-gray-400
  disabled:cursor-not-allowed
`;

const HelpText = tw.p`
  text-xs
  text-gray-400
`;
