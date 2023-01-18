// eslint-disable-next-line import/prefer-default-export
export async function getCars(page?: number, limit?: number) {
  try {
    let url = 'http://127.0.0.1:3000/garage';
    if (page || limit) {
      if (!url.includes('?')) {
        url += '?';
      }
    }
    if (page) {
      url += `_page=${page}`;
    }
    if (limit) {
      if (page) {
        url += '&';
      }
      url += `_limit=${limit}`;
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

export async function deleteCar(id: string) {
  try {
    const url = `http://127.0.0.1:3000/garage/${id}`;
    const result = await fetch(url, {
      method: 'DELETE',
    });
    return result.status === 200;
  } catch (er) {
    return false;
  }
}

export async function addCar(name: string, color: string) {
  try {
    const url = 'http://127.0.0.1:3000/garage';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    });
    if (response.status === 201) {
      return response;
    }
    return null;
  } catch (er) {
    return null;
  }
}
