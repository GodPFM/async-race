// eslint-disable-next-line import/prefer-default-export
export async function getCars() {
  try {
    const response = await fetch('http://127.0.0.1:3000/garage?_page=1', {
      method: 'GET',
    });
    return await response.json();
  } catch (er) {
    console.error(er);
  }
  return null;
}
