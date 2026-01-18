export const createTransport = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'fake-id' })
});
