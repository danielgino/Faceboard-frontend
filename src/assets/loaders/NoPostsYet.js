import { Card, CardBody, Typography } from "@material-tailwind/react";
import { Ghost } from "lucide-react";
import { motion } from "framer-motion";

export default function NoPostsYet() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[300px] text-center"
        >
            <Card className="w-full max-w-2xl p-32 bg-gray-50 shadow-md">
                <CardBody className="flex flex-col items-center justify-center space-y-4">
                    <Ghost className="w-16 h-16 text-gray-400" />
                    <Typography variant="h5" color="gray">
                        No posts yet
                    </Typography>
                    <Typography color="gray" className="text-sm">
                        Posts will appear here.
                    </Typography>
                </CardBody>
            </Card>
        </motion.div>
    );
}
