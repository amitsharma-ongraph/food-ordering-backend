export const getRandomCode = () => {
  const chars = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * 25)];
  }
  return code;
};
