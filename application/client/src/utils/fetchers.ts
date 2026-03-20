import $ from "jquery";
import { gzip } from "pako";

let binaryTransportLoaded = false;
async function ensureBinaryTransportLoaded(): Promise<void> {
  if (binaryTransportLoaded) return;
  await import("jquery-binarytransport");
  binaryTransportLoaded = true;
}

export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  // `jquery-binarytransport` はデータ種別 `binary` を扱うためのトランスポート追加なので、
  // 最初に `fetchBinary` が呼ばれたタイミングでのみ読み込みます
  await ensureBinaryTransportLoaded();
  const result = await $.ajax({
    async: false,
    dataType: "binary",
    method: "GET",
    responseType: "arraybuffer",
    url,
  });
  return result;
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const result = await $.ajax({
    async: false,
    dataType: "json",
    method: "GET",
    url,
  });
  return result;
}

export async function sendFile<T>(url: string, file: File): Promise<T> {
  const result = await $.ajax({
    async: false,
    data: file,
    dataType: "json",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    method: "POST",
    processData: false,
    url,
  });
  return result;
}

export async function sendJSON<T>(url: string, data: object): Promise<T> {
  const jsonString = JSON.stringify(data);
  const uint8Array = new TextEncoder().encode(jsonString);
  const compressed = gzip(uint8Array);

  const result = await $.ajax({
    async: false,
    data: compressed,
    dataType: "json",
    headers: {
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
    },
    method: "POST",
    processData: false,
    url,
  });
  return result;
}
