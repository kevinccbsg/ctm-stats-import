const importData = require('..');
const {
  upsertPlayer, loadResult, upsertEvent, upsertMatch,
} = require('../store/supabase');

jest.mock('../store/supabase');

describe('upload the files correctly', () => {
  it('store correctly all records', async () => {
    // This mock has 6 players, 1 event 3 matches and 12 results
    await importData(`${__dirname}/fixtures/mockGames.csv`);
    expect(upsertPlayer).toHaveBeenCalledTimes(6);
    expect(upsertMatch).toHaveBeenCalledTimes(3);
    // we update events on each winner
    expect(upsertEvent).toHaveBeenCalledTimes(3);
    expect(loadResult).toHaveBeenCalledTimes(12);
  });
});
