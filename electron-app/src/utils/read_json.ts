import * as fs from "fs";

type ReadJsonResponse =
  | {
      success: true;
      data: any[][];
    }
  | {
      success: false;
      data: string;
    };

export const readJson = async (path: string): Promise<ReadJsonResponse> => {
  const fileContent = await fs.promises.readFile(path, "utf-8");
  try {
    const json = JSON.parse(fileContent);
    const data = json.data;
    if (!Array.isArray(data)) {
      return {
        success: false,
        data: "JSON data property is not an array",
      };
    }
    if (!data.every((row) => row.length === 18)) {
      const index = data.findIndex((row) => row.length !== 18);
      return {
        success: false,
        data: `JSON array entry ${index} has invalid length`,
      };
    }
    return {
      success: true,
      data,
    };
  } catch (e) {
    return {
      success: false,
      data: "The uploaded JSON is not valid",
    };
  }
};
