import { Card, CardBody, Typography } from "@material-tailwind/react";

function SectionCard({ title, icon: Icon, children, className = "" }) {
    return (
        <Card className={`rounded-ds-lg shadow-ds-low border border-dsNeutral-100 ${className}`}>
            <CardBody className="p-6 sm:p-8">
                {title && (
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-dsNeutral-100">
                        {Icon && <Icon className="w-4 h-4 text-dsNeutral-500" />}
                        {/* Kept on MT's own `color` prop rather than an
                            overriding className — Material Tailwind's
                            Typography resolves color/size through its own
                            theme system, and an appended className isn't a
                            reliable way to override it without a browser
                            check this environment can't run. */}
                        <Typography variant="h6" color="blue-gray">
                            {title}
                        </Typography>
                    </div>
                )}
                {children}
            </CardBody>
        </Card>
    );
}

export default SectionCard;
