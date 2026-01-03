// Bangalore Metro Phase 1 & 2 (2025 Vision) Data
// Coordinate approximation for demo purposes

export const metroLines = {
    purple: {
        name: "Purple Line",
        color: "#9c27b0",
        stations: [
            { name: "Challaghatta", lat: 12.9366, lng: 77.4619 },
            { name: "Kengeri", lat: 12.9368, lng: 77.4831 },
            { name: "Pattanegre", lat: 12.9366, lng: 77.5024 }, // Added as per previous context
            { name: "Mysore Road", lat: 12.9463, lng: 77.5300 },
            { name: "Deepanjali Nagar", lat: 12.9526, lng: 77.5398 },
            { name: "Attiguppe", lat: 12.9600, lng: 77.5336 },
            { name: "Vijayanagar", lat: 12.9702, lng: 77.5385 },
            { name: "Majestic", lat: 12.9757, lng: 77.5728, interchange: true }, // Key Interchange
            { name: "Central College", lat: 12.9734, lng: 77.5855 },
            { name: "Vidhana Soudha", lat: 12.9796, lng: 77.5925 },
            { name: "Cubbon Park", lat: 12.9808, lng: 77.5975 },
            { name: "MG Road", lat: 12.9754, lng: 77.6066, interchange: true },
            { name: "Trinity", lat: 12.9730, lng: 77.6167 },
            { name: "Indiranagar", lat: 12.9781, lng: 77.6408 },
            { name: "Swami Vivekananda Road", lat: 12.9816, lng: 77.6521 },
            { name: "Baiyappanahalli", lat: 12.9904, lng: 77.6529 },
            { name: "KR Puram", lat: 13.0003, lng: 77.6749, interchange: true }, // Blue line interchange
            { name: "Mahadevapura", lat: 12.9945, lng: 77.6961 },
            { name: "Garudacharpalya", lat: 12.9868, lng: 77.7126 },
            { name: "Hoodi", lat: 12.9897, lng: 77.7265 },
            { name: "Seetharampalya", lat: 12.9856, lng: 77.7370 },
            { name: "Kundalahalli", lat: 12.9757, lng: 77.7358 },
            { name: "Nallurhalli", lat: 12.9682, lng: 77.7350 },
            { name: "Sri Sathya Sai Hospital", lat: 12.9749, lng: 77.7267 },
            { name: "Pattandur Agrahara", lat: 12.9785, lng: 77.7478 },
            { name: "Kadugodi", lat: 12.9868, lng: 77.7554 }, // Whitefield
            { name: "Whitefield", lat: 12.9698, lng: 77.7499 }
        ]
    },
    green: {
        name: "Green Line",
        color: "#4caf50",
        stations: [
            { name: "Madavara", lat: 13.0534, lng: 77.4746 },
            { name: "Nagasandra", lat: 13.0475, lng: 77.5118 },
            { name: "Dasarahalli", lat: 13.0435, lng: 77.5193 },
            { name: "Jalahalli", lat: 13.0336, lng: 77.5348 },
            { name: "Peenya", lat: 13.0285, lng: 77.5350 },
            { name: "Yeshwantpur", lat: 13.0238, lng: 77.5503 },
            { name: "Sandal Soap Factory", lat: 13.0135, lng: 77.5540 },
            { name: "Mahalakshmi", lat: 13.0076, lng: 77.5498 },
            { name: "Rajajinagar", lat: 12.9975, lng: 77.5549 },
            { name: "Kuvempu Road", lat: 12.9904, lng: 77.5628 },
            { name: "Srirampura", lat: 12.9845, lng: 77.5684 },
            { name: "Majestic", lat: 12.9757, lng: 77.5728, interchange: true }, // Purple interchange
            { name: "Chickpete", lat: 12.9669, lng: 77.5746 },
            { name: "Krishna Rajendra Market", lat: 12.9620, lng: 77.5750 },
            { name: "National College", lat: 12.9515, lng: 77.5729 },
            { name: "Lalbagh", lat: 12.9468, lng: 77.5804 },
            { name: "South End Circle", lat: 12.9365, lng: 77.5815 },
            { name: "Jayanagar", lat: 12.9250, lng: 77.5838 },
            { name: "Rashtreeya Vidyalaya Road", lat: 12.9198, lng: 77.5801, interchange: true }, // Yellow Interchange
            { name: "Banashankari", lat: 12.9145, lng: 77.5732 },
            { name: "JP Nagar", lat: 12.9069, lng: 77.5744 },
            { name: "Yelachenahalli", lat: 12.8959, lng: 77.5701 },
            { name: "Konankunte Cross", lat: 12.8874, lng: 77.5740 },
            { name: "Doddakallasandra", lat: 12.8795, lng: 77.5745 },
            { name: "Vajarahalli", lat: 12.8712, lng: 77.5709 },
            { name: "Thalaghattapura", lat: 12.8631, lng: 77.5682 },
            { name: "Silk Institute", lat: 12.8576, lng: 77.5688 }
        ]
    },
    yellow: {
        name: "Yellow Line",
        color: "#ffeb3b",
        stations: [
            { name: "Rashtreeya Vidyalaya Road", lat: 12.9198, lng: 77.5801, interchange: true }, // Green Interchange
            { name: "Ragigudda", lat: 12.9123, lng: 77.5912 },
            { name: "Jayadeva Hospital", lat: 12.9174, lng: 77.5998, interchange: true }, // Pink Interchange
            { name: "BTM Layout", lat: 12.9150, lng: 77.6101 },
            { name: "Central Silk Board", lat: 12.9176, lng: 77.6227, interchange: true }, // Blue Interchange
            { name: "Bommanahalli", lat: 12.9088, lng: 77.6291 },
            { name: "Hongasandra", lat: 12.8988, lng: 77.6356 },
            { name: "Kudlu Gate", lat: 12.8912, lng: 77.6433 },
            { name: "Singasandra", lat: 12.8833, lng: 77.6521 },
            { name: "Hosa Road", lat: 12.8712, lng: 77.6588 },
            { name: "Beratena Agrahara", lat: 12.8621, lng: 77.6653 },
            { name: "Electronic City", lat: 12.8486, lng: 77.6710 },
            { name: "Konappana Agrahara", lat: 12.8412, lng: 77.6788 },
            { name: "Huskur Road", lat: 12.8335, lng: 77.6845 },
            { name: "Hebbagodi", lat: 12.8252, lng: 77.6923 },
            { name: "Bommasandra", lat: 12.8166, lng: 77.6998 }
        ]
    },
    pink: {
        name: "Pink Line",
        color: "#e91e63",
        stations: [
            { name: "Kalena Agrahara", lat: 12.8812, lng: 77.5956 },
            { name: "Hulimavu", lat: 12.8895, lng: 77.5968 },
            { name: "IIM Bangalore", lat: 12.8988, lng: 77.5985 },
            { name: "JP Nagar 4th Phase", lat: 12.9067, lng: 77.5995 },
            { name: "Jayadeva Hospital", lat: 12.9174, lng: 77.5998, interchange: true }, // Yellow Interchange
            { name: "Tavarekere", lat: 12.9265, lng: 77.6042 },
            { name: "Dairy Circle", lat: 12.9362, lng: 77.6065 },
            { name: "Lakkasandra", lat: 12.9431, lng: 77.6072 },
            { name: "Langford Town", lat: 12.9525, lng: 77.6085 },
            { name: "Rashtriya Military School", lat: 12.9612, lng: 77.6105 },
            { name: "MG Road", lat: 12.9754, lng: 77.6066, interchange: true }, // Purple Interchange
            { name: "Shivajinagar", lat: 12.9856, lng: 77.6045 },
            { name: "Cantonment", lat: 12.9936, lng: 77.5985 },
            { name: "Pottery Town", lat: 13.0012, lng: 77.6023 },
            { name: "Tannery Road", lat: 13.0098, lng: 77.6085 },
            { name: "Venkateshpura", lat: 13.0185, lng: 77.6142 },
            { name: "Arabic College", lat: 13.0256, lng: 77.6205 },
            { name: "Nagavara", lat: 13.0358, lng: 77.6225, interchange: true } // Blue Interchange
        ]
    },
    blue: {
        name: "Blue Line", // ORR-Airport Line
        color: "#2196f3",
        stations: [
            { name: "Central Silk Board", lat: 12.9176, lng: 77.6227, interchange: true }, // Yellow Interchange
            { name: "HSR Layout", lat: 12.9125, lng: 77.6405 },
            { name: "Agara", lat: 12.9234, lng: 77.6478 },
            { name: "Ibbalur", lat: 12.9289, lng: 77.6534 },
            { name: "Bellandur", lat: 12.9356, lng: 77.6621 },
            { name: "Kadubeesanahalli", lat: 12.9432, lng: 77.6789 },
            { name: "Kodibeesanahalli", lat: 12.9512, lng: 77.6895 },
            { name: "Marathahalli", lat: 12.9591, lng: 77.6974 },
            { name: "ISRO", lat: 12.9689, lng: 77.7023 },
            { name: "Doddanekundi", lat: 12.9756, lng: 77.7012 },
            { name: "DRDO Sports Complex", lat: 12.9867, lng: 77.6985 },
            { name: "Mahadevapura", lat: 12.9945, lng: 77.6961 },
            { name: "KR Puram", lat: 13.0003, lng: 77.6749, interchange: true }, // Purple Interchange
            { name: "Kasturi Nagar", lat: 13.0098, lng: 77.6654 },
            { name: "Horamavu", lat: 13.0185, lng: 77.6532 },
            { name: "HRBR Layout", lat: 13.0245, lng: 77.6412 },
            { name: "Kalyan Nagar", lat: 13.0305, lng: 77.6321 },
            { name: "HBR Layout", lat: 13.0335, lng: 77.6254 },
            { name: "Nagavara", lat: 13.0358, lng: 77.6225, interchange: true }, // Pink Interchange
            { name: "Veeranapalya", lat: 13.0412, lng: 77.6154 },
            { name: "Kempapura", lat: 13.0489, lng: 77.6087 },
            { name: "Hebbal", lat: 13.0358, lng: 77.5970 },
            { name: "Kodigehalli", lat: 13.0523, lng: 77.5895 },
            { name: "Jakkur Cross", lat: 13.0645, lng: 77.5956 },
            { name: "Yelahanka", lat: 13.1012, lng: 77.5963 },
            { name: "Bagalur Cross", lat: 13.1189, lng: 77.6087 },
            { name: "Bettahalasuru", lat: 13.1456, lng: 77.6234 },
            { name: "Dodajala", lat: 13.1678, lng: 77.6345 },
            { name: "Airport City", lat: 13.1890, lng: 77.6956 },
            { name: "KIAL Terminal", lat: 13.1986, lng: 77.7066 }
        ]
    }
};
