import React from 'react';
import { Card, CardHeader, CardBody } from "@material-tailwind/react";

function CommentLoader() {
    return (
        <Card shadow={false} className="w-full max-w-[48rem] bg-gray-50 px-4 py-2 mb-4 animate-pulse">
            <CardHeader
                color="transparent"
                floated={false}
                shadow={false}
                className="mx-0 flex items-center gap-4 pt-0 pb-8"
            >
                <div className="rounded-full bg-gray-300 h-12 w-12" />
                <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="bg-gray-300 h-4 w-32 rounded" />
                        <div className="bg-gray-300 h-3 w-20 rounded" />
                    </div>
                    <div className="bg-gray-300 h-3 w-24 rounded" />
                </div>
            </CardHeader>
            <CardBody className="mb-6 p-0 space-y-2">
                <div className="bg-gray-300 h-3 w-full rounded" />
                <div className="bg-gray-300 h-3 w-3/4 rounded" />
            </CardBody>
        </Card>
    );
}

export default CommentLoader;
