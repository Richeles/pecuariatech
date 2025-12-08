'use client';
import React from 'react';

interface FusionProps {
    data: any;
}

export default function UltraSimbioViz({ data }: FusionProps) {
    return (
        <div className='bg-green-700 p-4 rounded-xl shadow-lg text-white' style={{ minHeight: "300px" }}>
            <h2 className='text-xl font-semibold'>UltraSimbioViz</h2>
            <pre className='mt-2'>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}


