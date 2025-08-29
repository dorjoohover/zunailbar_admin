export async function imageUploader(form: FormData) {
  // 1) upload ticket авах (backend URL + headers)
  const ticketRes = await fetch("/api/cookie");
  if (!ticketRes.ok) throw new Error("ticket авахад алдаа");

  const { uploadUrl, headers } = await ticketRes.json() as {
    uploadUrl: string;
    headers: Record<string, string>;
  };

  // 2) formdata-гаа шууд backend руу илгээнэ
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers,      // зөвхөн auth header-ууд
    body: form,   // FormData → multipart/form-data автоматаар болно
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}