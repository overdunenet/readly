/**
 * @ApiOperation({ summary: '영상파일 등록' })
 * @ApiResponse({ status: 200, type: ResponseMediaDto })
 * @Post()
 * @Transactional -> !!HTTP decorator 아래 작성해야함!!
 * async createMedia(@Body() createMediaBody: RequestCreateMediaDto, @SpaceId() spaceId: number): Promise<ResponseMediaDto> {
 */

export const Transactional = (
  target: any,
  propertyKey: string,
  descriptor: any
) => {
  const originalMethod = descriptor.value;

  const proxy = new Proxy(originalMethod, {
    apply: function (target, thisArg, args) {
      if (
        thisArg.transactionService &&
        typeof thisArg.transactionService.runInTransaction === 'function'
      ) {
        return thisArg.transactionService.runInTransaction(() =>
          target.apply(thisArg, args)
        );
      } else {
        throw new Error(
          'No transactionManager or runInTransaction method found on the instance'
        );
      }
    },
  });

  // 원본 함수의 메타데이터를 Proxy로 복사 (데코레이터 순서에 관계없이 동작하도록 방어)
  const metadataKeys = Reflect.getMetadataKeys(originalMethod);
  metadataKeys.forEach(key => {
    Reflect.defineMetadata(
      key,
      Reflect.getMetadata(key, originalMethod),
      proxy
    );
  });

  descriptor.value = proxy;

  return descriptor;
};
