// mammoth'un tarayıcı paketi (UMD) için asgari tip tanımı.
declare module "mammoth/mammoth.browser" {
  interface MammothResult {
    value: string;
    messages: { type: string; message: string }[];
  }
  interface MammothApi {
    convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
    extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
  }
  const mammoth: MammothApi;
  export default mammoth;
  export const convertToHtml: MammothApi["convertToHtml"];
  export const extractRawText: MammothApi["extractRawText"];
}
