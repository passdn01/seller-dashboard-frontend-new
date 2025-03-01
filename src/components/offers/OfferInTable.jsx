import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function OfferInTable({ offer }) {
  // Calculate offer status based on dates
  const currentDate = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = new Date(offer.endDate);
  
  let status = "Active";
  let statusColor = "bg-green-500";
  
  if (currentDate < startDate) {
    status = "Upcoming";
    statusColor = "bg-yellow-500";
  } else if (currentDate > endDate) {
    status = "Expired";
    statusColor = "bg-red-500";
  }

  return (
    <div className="p-4 bg-gray-50">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Offer Details</h3>
        <Badge className={`${statusColor} text-white`}>{status}</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Basic Information</h4>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Offer ID</p>
                  <p className="font-medium">{offer._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{offer.offerName}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{offer.offerDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-sm">
                    {format(new Date(offer.startDate), 'dd MMM yyyy')} - 
                    {format(new Date(offer.endDate), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Days Remaining</p>
                  <p className="text-sm">
                    {currentDate > endDate 
                      ? 'Expired' 
                      : currentDate < startDate
                        ? 'Not started yet'
                        : `${Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24))} days`
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Criteria & Reward</h4>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Criteria Type</p>
                  <p className="font-medium capitalize">{offer.offerCriteria.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Required Count</p>
                  <p className="font-medium">{offer.offerCriteria.requiredCount} {offer.offerCriteria.type}</p>
                </div>
              </div>
              
              {offer.offerCriteria.type === 'online' && (
                <div>
                  <p className="text-sm text-gray-500">Threshold Time</p>
                  <p className="text-sm">{offer.offerCriteria.thresholdTime} ms</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Reward Amount</p>
                <p className="font-medium text-lg">₹{offer.reward}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Terms & Conditions</p>
                <p className="text-sm">{offer.terms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OfferInTable;