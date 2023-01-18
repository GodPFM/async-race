// eslint-disable-next-line import/prefer-default-export
export async function getCars(page?: number, limit?: number) {
  try {
    let url = 'http://127.0.0.1:3000/garage';
    if (page) {
      if (!url.includes('?')) {
        url += '?';
      }
      url += `_page=${page}`;
    }
    const response = await fetch(url, {
      method: 'GET',
    });
    return await response.json();
  } catch (er) {
    console.error(er);
  }
  return null;
}
