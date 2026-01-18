export function validarSenhaForte(senha: string) {
  // mínimo 8, 1 maiúscula, 1 número, 1 especial
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(senha);
}
