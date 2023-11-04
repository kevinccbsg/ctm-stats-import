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
    upsertPlayer.mock.calls.forEach((call) => {
      expect(typeof call[0]).toEqual('string');
    });
    expect(upsertMatch).toHaveBeenCalledTimes(3);
    const [eventName, year, winnerId, player] = upsertMatch.mock.calls[0];
    expect(eventName).toEqual('December 2017 CTM');
    expect(year).toEqual('2017');
    expect(winnerId).toEqual('1');
    expect(typeof player).toEqual('string');
    // we update events on each winner
    expect(upsertEvent).toHaveBeenCalledTimes(3);
    upsertEvent.mock.calls.forEach((call) => {
      expect(call[0]).toEqual('December 2017 CTM');
      expect(call[1]).toEqual('2017');
    });
    expect(loadResult).toHaveBeenCalledTimes(12);
    loadResult.mock.calls.forEach((call) => {
      expect(call[0]).toEqual(expect.objectContaining({
        Players: expect.any(String),
        Game: expect.any(String),
        Playstyle: expect.any(String),
        'Won?': expect.any(String),
        'Total Lines': expect.any(String),
        'Final Score': expect.any(String),
        '19 L Start': expect.any(String),
        '19 Trans': expect.any(String),
        'Post Score': expect.any(String),
        '29 L Start': expect.any(String),
        '29 Trans': expect.any(String),
        '29 Lines': expect.any(String),
        '29 Score': expect.any(String),
        'No M Lines': expect.any(String),
        'No M Score': expect.any(String),
        'Topout Type': expect.any(String),
        Cap: expect.any(String),
        SPS: expect.any(String),
        'Lvl Start': expect.any(String),
        Event: expect.any(String),
        Round: expect.any(String),
        'Game Link': expect.any(String),
        'Match Pairing': expect.any(String),
        'Game ID': expect.any(String),
        'Match ID': expect.any(String),
        Year: expect.any(String),
        'Match Winner': expect.any(String),
      }));
    });
  });
});
