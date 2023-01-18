// eslint-disable-next-line import/prefer-default-export

import { ItemData } from './types';

export async function getCars(page?: number, limit?: number): Promise<[[ItemData], number] | null> {
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
    const totalCount = await response.headers.get('X-Total-Count');
    return [await response.json(), Number(totalCount)];
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

export async function updateCar(itemData: ItemData) {
  try {
    const url = `http://127.0.0.1:3000/garage/${itemData.id}`;
    const request = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: itemData.name, color: itemData.color }),
    });
    if (request.status === 200) {
      return request;
    }
    return null;
  } catch (e) {
    return null;
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
