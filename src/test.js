//INFO: write tests here
//SEE: https://mochajs.org/#getting-started

describe('SeedIndex', function () {
  describe('seedIndex store', function () {
		it('should return valid format if no data', function () {
			let r= store_seedIndex_get();
			expect(r).to.equal({ MyKey: "0x333333", content: {} }); //TODO:
    });
  });
});
