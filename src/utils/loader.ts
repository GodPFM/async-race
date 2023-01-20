// eslint-disable-next-line import/prefer-default-export

import { CarParam, ItemData } from './types';

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

export async function deleteCar(id: string): Promise<boolean> {
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

export async function updateCar(itemData: ItemData): Promise<ItemData | null> {
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
      return await request.json();
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function addCar(name: string, color: string): Promise<ItemData | null> {
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
      const objectWithData = await response.json();
      return objectWithData;
    }
    return null;
  } catch (er) {
    return null;
  }
}

export async function startStopEngine(id: string, action: string): Promise<CarParam | null> {
  try {
    const url = `http://127.0.0.1:3000/engine?id=${id}&status=${action}`;
    const response = await fetch(url, {
      method: 'PATCH',
    });
    if (response.status === 200) {
      return await response.json();
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function carStart(id: string): Promise<boolean | null> {
  try {
    const url = `http://127.0.0.1:3000/engine?id=${id}&status=drive`;
    const response = await fetch(url, {
      method: 'PATCH',
    });
    if (response.status === 200) {
      return true;
    }
    if (response.status === 500) {
      return null;
    }
    console.log(response);
    return false;
  } catch (e) {
    return false;
  }
}
