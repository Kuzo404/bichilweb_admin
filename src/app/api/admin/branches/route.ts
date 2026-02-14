import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// GET - Fetch all branches
export async function GET() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/branches`);
        if (!res.ok) throw new Error('Backend request failed');

        const branches = await res.json();

        // Return backend data directly (no transformation needed)
        const items = branches.map((branch: any) => ({
            id: branch.branch_id.toString(),
            branch_name: branch.branch_name,
            address: branch.address,
            work_days: branch.work_days,
            work_hours: branch.work_hours,
            latitude: branch.latitude,
            longitude: branch.longitude,
            phone_numbers: branch.phone_numbers || [],
            province_name: branch.province_name,
            district_name: branch.district_name,
            region_name: branch.region_name,
        }));

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching branches:', error);
        return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
    }
}

// POST - Create new branch
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Send data directly to backend (matches frontend structure)
        const backendData = {
            branch_name: data.branch_name,
            address: data.address,
            work_days: data.work_days,
            work_hours: data.work_hours,
            latitude: data.latitude,
            longitude: data.longitude,
            phone_numbers: data.phone_numbers || [],
            province_name: data.province_name,
            district_name: data.district_name,
            region_name: data.region_name,
        };

        const res = await fetch(`${BACKEND_URL}/api/branches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData),
        });

        if (!res.ok) throw new Error('Backend request failed');

        const result = await res.json();
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating branch:', error);
        return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
    }
}

// PUT - Update branch
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
        }

        const data = await request.json();

        // Send data directly to backend (matches frontend structure)
        const backendData = {
            branch_name: data.branch_name,
            address: data.address,
            work_days: data.work_days,
            work_hours: data.work_hours,
            latitude: data.latitude,
            longitude: data.longitude,
            phone_numbers: data.phone_numbers || [],
            province_name: data.province_name,
            district_name: data.district_name,
            region_name: data.region_name,
        };

        const res = await fetch(`${BACKEND_URL}/api/branches/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData),
        });

        if (!res.ok) throw new Error('Backend request failed');

        const result = await res.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating branch:', error);
        return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
    }
}

// DELETE - Remove branch
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}/api/branches/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) throw new Error('Backend request failed');

        const result = await res.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deleting branch:', error);
        return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
    }
}
