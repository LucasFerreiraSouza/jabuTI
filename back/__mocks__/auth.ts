jest.mock("../middlewares/auth", () => ({
  __esModule: true,
  auth: (req: any, _res: any, next: any) => {
    req.user = { id: req.headers["x-user-id"] || "1234567890abcdef12345678" };
    next();
  },
}));
