import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { SimpleBarChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const chartData = [
    { group: "Dataset 1", value: 65000 },
    { group: "Dataset 2", value: 29123 },
    { group: "Dataset 3", value: 35213 },
];

const chartOptions = {
    title: "Sample Carbon Bar Chart",
    axes: { left: { title: "Value" }, bottom: { title: "Category", mapsTo: "group", scaleType: "labels" } },
    height: "400px",
};

const PDFGenerator = () => {
    const contentRef = useRef(null);
    const downloadPDF = async () => {
        if (!contentRef.current) return;

        const canvas = await html2canvas(contentRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
        pdf.save("report.pdf");
    };

    return (
        <div className="p-4">

            <div ref={contentRef} className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-700 mb-4">PDF Report</h1>

                <Card className="mb-4">
                    <CardHeader>Data Summary</CardHeader>
                    <CardContent>
                        <p className="text-gray-600">This report contains a summary of the data along with a bar chart.</p>
                    </CardContent>
                </Card>

                {/* Carbon Charts */}
                <div className="flex justify-center">
                    <SimpleBarChart data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Download Button */}
            <button
                onClick={downloadPDF}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
                Download PDF
            </button>
        </div>
    );
};

export default PDFGenerator;
