// eslint-disable-next-line import/prefer-default-export
import { CarParam, ItemData, WinnerParams } from './types';

let controller = new AbortController();
export const { signal } = controller;

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

export async function deleteWinner(id: string) {
  try {
    const url = `http://127.0.0.1:3000/winners/${id}`;
    await fetch(url, {
      method: 'DELETE',
    });
  } catch (e) {
    console.log(e);
  }
}

export async function deleteCar(id: string): Promise<boolean> {
  try {
    const url = `http://127.0.0.1:3000/garage/${id}`;
    const result = await fetch(url, {
      method: 'DELETE',
    });
    await deleteWinner(id);
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

export async function startEngine(id: string): Promise<CarParam | null> {
  try {
    if (controller.signal.aborted) {
      controller = new AbortController();
    }
    const url = `http://127.0.0.1:3000/engine?id=${id}&status=started`;
    const response = await fetch(url, {
      method: 'PATCH',
      signal: controller.signal,
    });
    if (response.status === 200) {
      return await response.json();
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function stopEngine(id: string, isAll: boolean): Promise<CarParam | null> {
  try {
    if (isAll) {
      controller.abort();
    }
    const url = `http://127.0.0.1:3000/engine?id=${id}&status=stopped`;
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
      signal: controller.signal,
    });
    if (response.status === 200) {
      return true;
    }
    if (response.status === 500) {
      return null;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function getWinner(id: string): Promise<WinnerParams | boolean | null> {
  try {
    const url = `http://127.0.0.1:3000/winners/${id}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    if (response.status === 200) {
      return await response.json();
    }
    if (response.status === 404) {
      return false;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function createWinner(winnerParams: WinnerParams): Promise<boolean> {
  try {
    const url = `http://127.0.0.1:3000/winners`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winnerParams),
    });
    return response.status === 201;
  } catch (e) {
    return false;
  }
}

export async function updateWinnerInfo(winnerParams: WinnerParams): Promise<boolean | null> {
  try {
    const url = `http://127.0.0.1:3000/winners/${winnerParams.id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wins: winnerParams.wins, time: winnerParams.time }),
    });
    return response.status === 200;
  } catch (e) {
    return null;
  }
}
