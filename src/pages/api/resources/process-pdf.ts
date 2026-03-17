import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import Resource from "@/models/Resource";
import clientPromise from "@/lib/db";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      await clientPromise;
      const { fields, files } = await parseForm(req);
      const resourceId = fields.resourceId as string;
      const file = files.file as formidable.File;

      if (!resourceId || !file) {
        return res
          .status(400)
          .json({ message: "Missing resourceId or file" });
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const outlines = pdfDoc.getOutlines();

      const toc = outlines.map((outline: any) => ({
        title: outline.getTitle(),
        page: outline.getPage().pageIndex + 1,
      }));

      await Resource.updateOne(
        { _id: resourceId, "files.fileName": file.originalFilename },
        { $set: { "files.$.toc": toc } }
      );

      res.status(200).json({ message: "PDF processed successfully", toc });
    } catch (error) {
      res.status(500).json({ message: "Error processing PDF", error });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
