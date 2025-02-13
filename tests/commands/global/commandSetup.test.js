const command = require('commands/global/setup'); // Adjust the path to your help command file
const SetupHandler = require('handlers/setupHandler');

jest.mock('handlers/setupHandler');

const startSetupMock = jest.fn();

describe('/setup command', () => {

    beforeAll(() => {
         // Mock console.log
         jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    beforeEach(() => {
        SetupHandler.mockClear();
    });

    afterAll(() => {
        console.log.mockRestore();
    });

    test('should reply with the help embed without setup info when setup is complete', async () => {

        SetupHandler.mockImplementation(() => {
            return {
                startSetup: startSetupMock,
            }
        })
        
        await command.execute({});

        expect(startSetupMock).toHaveBeenCalled()
    });
});
