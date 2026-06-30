export const DRIVE_SAVE_FILE_NAME = 'onurkolofficial.spsgame_data.json';

export const getHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export const findSaveFile = async (accessToken: string): Promise<string | null> => {
  const q = encodeURIComponent(`name='${DRIVE_SAVE_FILE_NAME}'`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=appDataFolder`, {
    headers: getHeaders(accessToken),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to find save file on Google Drive: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
};

export const createSaveFile = async (accessToken: string): Promise<string> => {
  const metadata = {
    name: DRIVE_SAVE_FILE_NAME,
    parents: ['appDataFolder'],
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      ...getHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create save file on Google Drive: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.id;
};

export const uploadSaveData = async (accessToken: string, fileId: string, saveData: any) => {
  const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saveData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload save data to Google Drive: ${response.status} ${errorText}`);
  }
};

export const downloadSaveData = async (accessToken: string, fileId: string): Promise<any> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: getHeaders(accessToken),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to download save data from Google Drive: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const syncDataToDrive = async (accessToken: string, data: any) => {
  let fileId = await findSaveFile(accessToken);
  if (!fileId) {
    fileId = await createSaveFile(accessToken);
  }
  await uploadSaveData(accessToken, fileId, data);
};

export const syncDataFromDrive = async (accessToken: string): Promise<any | null> => {
  const fileId = await findSaveFile(accessToken);
  if (fileId) {
    return await downloadSaveData(accessToken, fileId);
  }
  return null;
};
