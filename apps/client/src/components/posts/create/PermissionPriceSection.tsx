import { Controller, Control, FieldErrors } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { ACCESS_LEVEL_OPTIONS } from '@/shared/constants/access-level';

import { CreatePostForm } from './types';

interface PermissionPriceSectionProps {
  control: Control<CreatePostForm>;
  errors: FieldErrors<CreatePostForm>;
  watchedAccessLevel: string;
}

export function PermissionPriceSection({
  control,
  errors,
  watchedAccessLevel,
}: PermissionPriceSectionProps) {
  return (
    <FormSection>
      <SectionTitle>접근 권한 설정</SectionTitle>

      <FormField>
        <Label>접근 권한 *</Label>
        <Controller
          name="accessLevel"
          control={control}
          render={({ field }) => (
            <AccessLevelGrid>
              {ACCESS_LEVEL_OPTIONS.map((option) => (
                <AccessLevelOptionComponent key={option.value}>
                  <AccessLevelRadio
                    {...field}
                    type="radio"
                    value={option.value}
                    id={option.value}
                    checked={field.value === option.value}
                  />
                  <AccessLevelLabel
                    htmlFor={option.value}
                    isSelected={field.value === option.value}
                  >
                    <AccessLevelTitle>{option.label}</AccessLevelTitle>
                    <AccessLevelDescription>
                      {option.description}
                    </AccessLevelDescription>
                  </AccessLevelLabel>
                </AccessLevelOptionComponent>
              ))}
            </AccessLevelGrid>
          )}
        />
        {errors.accessLevel && (
          <ErrorMessage>{errors.accessLevel.message}</ErrorMessage>
        )}
      </FormField>

      {watchedAccessLevel === 'purchaser' && (
        <FormField>
          <Label>판매 가격 *</Label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <PriceInputWrapper>
                <PriceInput
                  {...field}
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(Number(e.target.value))
                  }
                  hasError={!!errors.price}
                />
                <PriceUnit>원</PriceUnit>
              </PriceInputWrapper>
            )}
          />
          {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
          <FieldHint>1,000원 단위로 입력해주세요</FieldHint>
        </FormField>
      )}
    </FormSection>
  );
}

// Styled Components
const FormSection = tw.div`
  bg-white
  rounded-lg
  border
  border-gray-200
  p-6
  space-y-6
`;

const SectionTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
  mb-4
`;

const FormField = tw.div`
  space-y-2
`;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const AccessLevelGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  gap-4
`;

const AccessLevelOptionComponent = tw.div`
  relative
`;

const AccessLevelRadio = tw.input`
  sr-only
`;

const AccessLevelLabel = tw.label<{ isSelected: boolean }>`
  block
  p-4
  border
  ${(p) => (p.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}
  rounded-lg
  cursor-pointer
  hover:border-gray-300
  transition-colors
`;

const AccessLevelTitle = tw.div`
  font-medium
  text-gray-900
  mb-1
`;

const AccessLevelDescription = tw.div`
  text-sm
  text-gray-600
`;

const PriceInputWrapper = tw.div`
  relative
  max-w-xs
`;

const PriceInput = tw.input<{ hasError?: boolean }>`
  w-full
  px-3
  py-2
  pr-10
  border
  ${(p) => (p.hasError ? 'border-red-300' : 'border-gray-300')}
  rounded-lg
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
`;

const PriceUnit = tw.span`
  absolute
  right-3
  top-1/2
  transform
  -translate-y-1/2
  text-gray-500
  text-sm
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
`;

const FieldHint = tw.p`
  text-sm
  text-gray-500
`;
