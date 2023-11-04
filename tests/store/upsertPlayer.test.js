/* eslint-disable global-require */
const supabaseModule = require('../../store/supabase'); // Import the module

jest.mock('@supabase/supabase-js', () => {
  const mockUpsert = jest.fn();
  const mockSupabase = {
    from: jest.fn(() => ({
      upsert: mockUpsert,
    })),
  };
  return {
    createClient: jest.fn(() => mockSupabase),
  };
});

describe('test supabase store methods', () => {
  it('should upsert the players', async () => {
    // Call the function under test
    const playerName = 'Test Player';
    /*
    require('@supabase/supabase-js').createClient().from().upsert.mockReturnValue({
      data: { id: 1 },
      error: null,
    });
    */
    const data = await supabaseModule.upsertPlayer(playerName);
    // console.log(data);
    // Assert that the `upsert` method was called with the correct parameters
    expect(require('@supabase/supabase-js').createClient().from).toHaveBeenCalledWith('players');
    expect(require('@supabase/supabase-js').createClient().from().upsert).toHaveBeenCalledWith(
      {
        name: playerName,
        profile_picture_url: expect.any(String),
        twitch_url: expect.any(String),
      },
      { onConflict: 'name' },
    );

    // You can also assert the return value if needed
    expect(data).toEqual(undefined);
  });

  it('should upsert the events', async () => {
    // Call the function under test
    const eventName = 'CTM 2017';
    const eventYear = '2017';
    const data = await supabaseModule.upsertEvent(eventName, eventYear);

    // Assert that the `upsert` method was called with the correct parameters
    expect(require('@supabase/supabase-js').createClient().from).toHaveBeenCalledWith('events');
    expect(require('@supabase/supabase-js').createClient().from().upsert).toHaveBeenCalledWith(
      {
        name: eventName,
        year: eventYear,
      },
      { onConflict: 'name' },
    );

    // You can also assert the return value if needed
    expect(data).toEqual(undefined);
  });
});
