// Function to get dates in the desired format
function getDates() {
  const dateObj = new Date();

  const date = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const hour = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();

  const result = `${date}-${month}-${year} ${hour}:${minutes}:${seconds}`;
  return result;
}

module.exports = { getDates };
