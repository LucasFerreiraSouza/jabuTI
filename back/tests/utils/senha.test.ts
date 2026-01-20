import { validarSenhaForte } from "../../utils/senha";

describe("validarSenhaForte", () => {
  it("deve retornar true para senha forte válida", () => {
    const senha = "Abcdef1@";
    expect(validarSenhaForte(senha)).toBe(true);
  });

  it("deve retornar false se não tiver 8 caracteres", () => {
    const senha = "Abc1@";
    expect(validarSenhaForte(senha)).toBe(false);
  });

  it("deve retornar false se não tiver letra maiúscula", () => {
    const senha = "abcdef1@";
    expect(validarSenhaForte(senha)).toBe(false);
  });

  it("deve retornar false se não tiver número", () => {
    const senha = "Abcdefgh@";
    expect(validarSenhaForte(senha)).toBe(false);
  });

  it("deve retornar false se não tiver caractere especial", () => {
    const senha = "Abcdef12";
    expect(validarSenhaForte(senha)).toBe(false);
  });
});
