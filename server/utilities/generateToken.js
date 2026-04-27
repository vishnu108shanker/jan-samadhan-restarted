const generateToken = () => {
  return (
    "TOK" +
    Date.now().toString(36) +   // compact time
    Math.random().toString(36).slice(2, 6) // random
  ).toUpperCase();
};


module.exports = generateToken;