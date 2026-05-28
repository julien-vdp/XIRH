import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Use os.tmpdir() to ensure write permissions and standalone compatibility
const filePath = path.join(os.tmpdir(), 'encombrants_requests_db.json');

// Helper to calculate the next 3 Wednesdays dynamically
function getDynamicWednesdays() {
  const dates: string[] = [];
  const today = new Date();
  let dayOfWeek = today.getDay();
  let daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
  if (daysUntilWednesday === 0) {
    daysUntilWednesday = 7;
  }
  const nextWednesday = new Date(today);
  nextWednesday.setDate(today.getDate() + daysUntilWednesday);

  for (let i = 0; i < 3; i++) {
    const d = new Date(nextWednesday);
    d.setDate(nextWednesday.getDate() + (i * 7));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

const getDefaultMockData = () => {
  const wednesdays = getDynamicWednesdays();
  return [
    {
      id: 'DEC-94600-87291',
      fullName: 'Marc Morel',
      email: 'marc.morel@gmail.com',
      phone: '06 87 65 43 21',
      address: '12 Rue de l\'Église, 94600 Choisy-le-Roi',
      dateIndex: 0,
      items: {
        mobilier: [
          { id: 'matelas', name: 'Matelas / Sommier', desc: 'Matelas 1 ou 2 places, sommier à lattes', qty: 1 },
          { id: 'armoire', name: 'Armoire / Commode', desc: 'Armoire commode, buffet', qty: 0 },
          { id: 'canape', name: 'Canapé / Fauteuil', desc: 'Canapé convertible, canapé droit', qty: 0 },
          { id: 'table', name: 'Table / Bureau', desc: 'Table de cuisine, bureau', qty: 0 },
          { id: 'chaise', name: 'Chaise / Tabouret', desc: 'Chaises individuelles, tabourets', qty: 2 }
        ],
        electro: [],
        loisirs: [],
        divers: []
      },
      totalQty: 3,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'DEC-94600-29103',
      fullName: 'Sophie Bernard',
      email: 's.bernard@yahoo.fr',
      phone: '07 12 34 56 78',
      address: '45 Avenue de la République, 94600 Choisy-le-Roi',
      dateIndex: 0,
      items: {
        mobilier: [],
        electro: [
          { id: 'frigo', name: 'Réfrigérateur / Congélateur', desc: 'Gros électroménager froid', qty: 1 },
          { id: 'lavelinge', name: 'Lave-linge / Sèche-linge', desc: 'Lave-linge, lave-vaisselle', qty: 0 },
          { id: 'four', name: 'Four / Micro-ondes', desc: 'Four, plaques, micro-ondes', qty: 0 },
          { id: 'tele', name: 'Téléviseur / Écran', desc: 'Téléviseurs anciens ou écrans plats', qty: 0 }
        ],
        loisirs: [],
        divers: []
      },
      totalQty: 1,
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'DEC-94600-54910',
      fullName: 'Lucas Petit',
      email: 'lucas.petit@outlook.fr',
      phone: '06 43 21 87 65',
      address: '8 Rue Jean Jaurès, 94600 Choisy-le-Roi',
      dateIndex: 1,
      items: {
        mobilier: [
          { id: 'matelas', name: 'Matelas / Sommier', desc: 'Matelas 1 ou 2 places', qty: 0 },
          { id: 'armoire', name: 'Armoire / Commode', desc: 'Armoire commode, buffet', qty: 0 },
          { id: 'canape', name: 'Canapé / Fauteuil', desc: 'Canapé convertible', qty: 0 },
          { id: 'table', name: 'Table / Bureau', desc: 'Table de cuisine, bureau', qty: 1 },
          { id: 'chaise', name: 'Chaise / Tabouret', desc: 'Chaises', qty: 0 }
        ],
        electro: [
          { id: 'frigo', name: 'Réfrigérateur', desc: 'Frigo', qty: 0 },
          { id: 'lavelinge', name: 'Lave-linge', desc: 'Lave-linge', qty: 1 },
          { id: 'four', name: 'Four', desc: 'Four', qty: 0 },
          { id: 'tele', name: 'Téléviseur', desc: 'Télé', qty: 1 }
        ],
        loisirs: [],
        divers: []
      },
      totalQty: 3,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 'DEC-94600-72109',
      fullName: 'Emma Roussel',
      email: 'emma.roussel@gmail.com',
      phone: '07 98 76 54 32',
      address: '27 Rue de la Marne, 94600 Choisy-le-Roi',
      dateIndex: 2,
      items: {
        mobilier: [],
        electro: [],
        loisirs: [
          { id: 'velo', name: 'Vélo / Trottinette', desc: 'Vélos adultes/enfants', qty: 1 },
          { id: 'salonjardin', name: 'Salon de jardin', desc: 'Mobilier extérieur', qty: 0 },
          { id: 'outillage', name: 'Outillage', desc: 'Tondeuse, outils', qty: 0 },
          { id: 'jouets', name: 'Cabanes / Jouets', desc: 'Grands jouets', qty: 0 }
        ],
        divers: [
          { id: 'carton', name: 'Grands cartons', desc: 'Cartons vides pliés', qty: 0 },
          { id: 'palette', name: 'Palettes en bois', desc: 'Palettes', qty: 3 },
          { id: 'ferraille', name: 'Ferraille / Métaux', desc: 'Ferraille', qty: 0 },
          { id: 'planches', name: 'Planches / Portes', desc: 'Planches', qty: 0 }
        ]
      },
      totalQty: 4,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
};

// Helper to read database with dynamic dates
function readData() {
  try {
    if (!fs.existsSync(filePath)) {
      // Initialize with default mock data
      const defaultMock = getDefaultMockData();
      fs.writeFileSync(filePath, JSON.stringify(defaultMock, null, 2), 'utf-8');
      return defaultMock;
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const requests = JSON.parse(rawData);
    
    // Resolve dynamic dates for default mock items
    const wednesdays = getDynamicWednesdays();
    return requests.map((req: any) => {
      if (typeof req.dateIndex === 'number' && req.dateIndex >= 0 && req.dateIndex < wednesdays.length) {
        return {
          ...req,
          date: wednesdays[req.dateIndex]
        };
      }
      return req;
    });
  } catch (error) {
    console.error('Error reading encombrants JSON database:', error);
    // Fallback to in-memory mock data
    return getDefaultMockData();
  }
}

// Helper to write database
function writeData(data: any[]) {
  try {
    // Strip dynamic dates for entries that have a dateIndex (keep data clean)
    const cleaned = data.map((req: any) => {
      if (typeof req.dateIndex === 'number') {
        const { date, ...rest } = req;
        return rest;
      }
      return req;
    });
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to encombrants JSON database:', error);
    return false;
  }
}

export async function GET() {
  try {
    const requests = readData();
    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    const currentRequests = readData();

    if (type === 'create') {
      const newRequest = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        date: data.date, // User selected specific date
        items: data.items,
        totalQty: data.totalQty,
        status: data.status || 'PENDING',
        createdAt: data.createdAt || new Date().toISOString()
      };
      
      currentRequests.push(newRequest);
      writeData(currentRequests);
      return NextResponse.json({ success: true, request: newRequest });
    } 
    
    if (type === 'status') {
      const { id, status } = data;
      if (!id || !status) {
        return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
      }

      const updated = currentRequests.map((req: any) => {
        if (req.id === id) {
          return { ...req, status };
        }
        return req;
      });

      writeData(updated);
      const found = updated.find((req: any) => req.id === id);
      return NextResponse.json({ success: true, request: found });
    }

    if (type === 'reset') {
      const defaultMock = getDefaultMockData();
      writeData(defaultMock);
      return NextResponse.json({ success: true, requests: defaultMock });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in encombrants POST API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
