import { Controller, Control, FieldErrors } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import tw from 'tailwind-styled-components';

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
              <ReactQuill
                value={field.value}
                onChange={field.onChange}
                placeholder="포스트 내용을 작성하세요"
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
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

// ReactQuill configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
  'image',
];

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
  overflow-hidden
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
`;
