// React-based Trip Planner Interface (UI Mockup for Lewis County, WA)

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Clock } from "lucide-react";

// The API key is now securely handled in the server-side proxy route.
const GOOGLE_API_KEY = ""; // Replace with your API key

export default function TripPlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [tripTime, setTripTime] = useState(new Date());
  const [mode, setMode] = useState('depart');
  const [result, setResult] = useState(null);

  const fetchTransitRoute = async () => {
    if (!origin || !destination) {
      alert("Please enter both origin and destination.");
      return;
    }

    const baseUrl = "https://maps.googleapis.com/maps/api/directions/json";
    const params = new URLSearchParams({
      origin,
      destination,
      mode: "transit",
      key: GOOGLE_API_KEY,
    });

    const timeParam = Math.floor(tripTime.getTime() / 1000);
    if (mode === 'depart') {
      params.append("departure_time", timeParam.toString());
    } else {
      params.append("arrival_time", timeParam.toString());
    }

    const url = `${baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(`/api/proxy?target=${encodeURIComponent(url)}`, { method: 'GET' });
      const data = await response.json();
      console.log("Transit Route Response:", data);
      setResult(data);
    } catch (error) {
      console.error("Error fetching transit route:", error);
      alert("Failed to get directions. Please check your API key and network.");
    }
  };

  const handleSubmit = () => {
    console.log("Submitting trip request for Lewis County Transit", {
      origin,
      destination,
      time: tripTime,
      mode,
    });
    fetchTransitRoute();
  };

  const renderRouteSteps = (route) => {
    const steps = route?.legs?.[0]?.steps || [];
    return (
      <ul className="text-sm list-disc pl-5 space-y-1">
        {steps.map((step, index) => (
          <li key={index}>
            <span dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
            {step.transit_details && (
              <div className="ml-2 text-xs text-muted-foreground">
                Bus: {step.transit_details.line.short_name} — {step.transit_details.headsign}<br />
                From: {step.transit_details.departure_stop.name} at {step.transit_details.departure_time.text}<br />
                To: {step.transit_details.arrival_stop.name} at {step.transit_details.arrival_time.text}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="shadow-xl">
        <CardContent className="space-y-4">
          <h1 className="text-xl font-bold">Lewis County Transit Trip Planner</h1>
          <p className="text-sm text-muted-foreground">Plan your route using Lewis County public transportation.</p>

          <div>
            <Label htmlFor="origin">From</Label>
            <Input id="origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g., Chehalis Library, Centralia College" />
          </div>

          <div>
            <Label htmlFor="destination">To</Label>
            <Input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Twin Transit Center, Yard Birds Mall" />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Calendar selected={tripTime} onSelect={setTripTime} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(tripTime, "p")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <input
                    type="time"
                    className="border rounded p-2"
                    value={format(tripTime, 'HH:mm')}
                    onChange={e => {
                      const [hours, minutes] = e.target.value.split(":");
                      const newDate = new Date(tripTime);
                      newDate.setHours(Number(hours));
                      newDate.setMinutes(Number(minutes));
                      setTripTime(newDate);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label>
              <input type="radio" name="mode" checked={mode === 'depart'} onChange={() => setMode('depart')} /> Leave At
            </label>
            <label>
              <input type="radio" name="mode" checked={mode === 'arrive'} onChange={() => setMode('arrive')} /> Arrive By
            </label>
          </div>

          <Button onClick={handleSubmit}>Plan My Trip</Button>

          {result?.routes?.[0] && (
            <div className="mt-6 space-y-2">
              <h2 className="text-md font-semibold">Route Preview</h2>
              {renderRouteSteps(result.routes[0])}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
