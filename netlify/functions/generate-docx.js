const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

// API-Key Schutz
const API_KEY = process.env.DOCX_API_KEY;

exports.handler = async (event) => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // Auth
  const apiKey = event.headers['x-api-key'];
  if (API_KEY && apiKey !== API_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { template, data, filename } = body;

    if (!template || !data) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'template und data sind Pflichtfelder' })
      };
    }

    // Template laden (aus functions/templates/ Ordner)
    const templatePath = path.join(__dirname, 'templates', `${template}.docx`);

    if (!fs.existsSync(templatePath)) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Template '${template}' nicht gefunden` })
      };
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Fehlende Felder leer lassen statt Fehler werfen
      nullGetter: () => '',
    });

    doc.render(data);

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    const outputFilename = filename || `${template}_${new Date().toISOString().slice(0,10)}`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${outputFilename}.docx"`,
      },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('generate-docx error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, type: error.name })
    };
  }
};
