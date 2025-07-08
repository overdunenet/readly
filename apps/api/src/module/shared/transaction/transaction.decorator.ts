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

  descriptor.value = new Proxy(originalMethod, {
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

  return descriptor;
};
