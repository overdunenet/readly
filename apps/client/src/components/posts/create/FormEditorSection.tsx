import { Controller, Control, FieldErrors } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { BlockEditor } from './editor/BlockEditor';

import { CreatePostForm } from './types';

interface FormEditorSectionProps {
  control: Control<CreatePostForm>;
  errors: FieldErrors<CreatePostForm>;
}

export function FormEditorSection({ control, errors }: FormEditorSectionProps) {
  return (
    <FormSection>
      <FormField>
        <Label>제목 *</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TitleInput
              {...field}
              placeholder="포스트 제목을 입력하세요"
              hasError={!!errors.title}
            />
          )}
        />
        {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
      </FormField>

      <FormField>
        <Label>내용 *</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <EditorWrapper hasError={!!errors.content}>
              <BlockEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="포스트 내용을 작성하세요"
              />
            </EditorWrapper>
          )}
        />
        {errors.content && (
          <ErrorMessage>{errors.content.message}</ErrorMessage>
        )}
      </FormField>
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

const FormField = tw.div`
  space-y-2
`;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const TitleInput = tw.input<{ hasError?: boolean }>`
  w-full
  px-3
  py-2
  border
  ${(p) => (p.hasError ? 'border-red-300' : 'border-gray-300')}
  rounded-lg
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
  text-lg
  font-medium
`;

const EditorWrapper = tw.div<{ hasError?: boolean }>`
  ${(p) => (p.hasError ? 'border border-red-300' : 'border border-gray-300')}
  rounded-lg
  focus-within:ring-2
  focus-within:ring-blue-500
  focus-within:border-transparent
  transition-colors
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
`;
