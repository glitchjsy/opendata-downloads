import fs from "fs";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { transforms } from "./transformations.js";

const BASE_URL = "https://api.opendata.je/v1";
const LIMIT = 1000000;
const DATA_ROOT = path.resolve("data");
const RUN_DATE = new Date().toISOString();

const INDEX = {
    generatedAt: RUN_DATE,
    datasets: {}
}

async function run() {
    console.log("Starting...");

    await fetchAndWrite({
        path: "eatsafe",
        endpoint: "/eatsafe",
        select: d => d.results,
        transform: transforms.eatsafe
    });

    await fetchAndWrite({
        path: "toilets",
        endpoint: "/toilets",
        select: d => d.results,
        exclude: ["buildDate", "female", "male", "tenure"],
        transform: transforms.toilets
    });

    await fetchAndWrite({
        path: "defibrillators",
        endpoint: "/defibrillators",
        select: d => d.results,
        transform: transforms.defibrillators
    });

    await fetchAndWrite({
        path: "recycling",
        endpoint: "/recycling",
        select: d => d.results,
        transform: transforms.recycling
    });

    await fetchAndWrite({
        path: "vehicles",
        endpoint: "/vehicles",
        select: d => d.results,
        transform: transforms.vehicles
    });

    await fetchAndWriteObjectMap({
        path: "vehicles-colors",
        endpoint: "/vehicles/colors",
        key: "color",
        value: "count"
    });

    await fetchAndWriteObjectMap({
        path: "vehicles-makes",
        endpoint: "/vehicles/makes",
        key: "make",
        value: "count"
    });

    await fetchAndWriteObjectMap({
        path: "vehicles-models",
        endpoint: "/vehicles/models",
        key: "model",
        value: "count"
    });

    await fetchAndWrite({
        path: "carparks",
        endpoint: "/carparks",
        select: d => d.results,
        transform: transforms.carparks
    });

    await fetchAndWrite({
        path: "foi-requests",
        endpoint: "/foi-requests",
        select: d => d.results,
        transform: transforms.foi
    });

    await fetchAndWrite({
        path: "bus-stops",
        endpoint: "/bus/stops",
        select: d => d.results,
        transform: transforms.busStops
    });

    updateReadme();
    writeIndex();

    console.log("Done");
}

async function fetchAndWrite({
    path: datasetPath,
    endpoint,
    select,
    exclude,
    transform
}) {
    const dir = path.join(DATA_ROOT, datasetPath);
    let data = await fetchEndpoint(endpoint);

    if (select && Array.isArray(exclude)) {
        let newData = select(data).map(d => Object.fromEntries(
            Object.entries(d).filter(([k]) => !exclude.includes(k))
        ));
        data = {
            results: newData
        }
    }

    data = {
        pagination: data?.pagination || undefined,
        results: data.results
    }

    writeJson(dir, `${datasetPath}.json`, data);

    if (select && transform) {
        const rows = select(data).map(transform);
        writeCsv(dir, `${datasetPath}.csv`, rows);
    }
}

async function fetchAndWriteObjectMap({
    path: datasetPath,
    endpoint,
    key,
    value
}) {
    const dir = path.join(DATA_ROOT, datasetPath);
    const data = await fetchEndpoint(endpoint);

    writeJson(dir, `${datasetPath}.json`, data);
    writeCsv(
        dir,
        `${datasetPath}.csv`,
        objectMapToRows(data.results, key, value)
    );
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function fetchEndpoint(endpoint) {
    console.log(`Fetching ${endpoint}...`);

    const url = `${BASE_URL}${endpoint}?limit=${LIMIT}`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
    }

    return res.json();
}

function writeJson(dir, filename, data) {
    ensureDir(dir);

    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    recordFile(path.basename(dir), filePath);
}

function writeCsv(dir, filename, records) {
    if (!records.length) {
        return;
    }
    ensureDir(dir);

    const csv = stringify(records, { header: true });
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, csv);
    recordFile(path.basename(dir), filePath);
}

function objectMapToRows(obj, keyName, valueName) {
    return Object.entries(obj).map(([key, value]) => ({
        [keyName]: key,
        [valueName]: value
    }));
}

function recordFile(dataset, filePath) {
    const stats = fs.statSync(filePath);
    const relativePath = path
        .relative(DATA_ROOT, filePath)
        .replace(/\\/g, "/");

    if (!INDEX.datasets[dataset]) {
        INDEX.datasets[dataset] = {
            files: []
        };
    }

    INDEX.datasets[dataset].files.push({
        path: relativePath,
        sizeBytes: stats.size
    });
}

function writeIndex() {
    const indexPath = path.join(DATA_ROOT, "index.json");
    fs.writeFileSync(indexPath, JSON.stringify(INDEX, null, 2));
}

function updateReadme() {
    const readmePath = "README.md";
    if (!fs.existsSync(readmePath)) return;

    const date = new Date().toISOString().split("T")[0];
    let content = fs.readFileSync(readmePath, "utf8");

    if (/Last updated:/i.test(content)) {
        content = content.replace(/Last updated:.*/i, `Last updated: ${date}`);
    } else {
        content += `\n\nLast updated: ${date}\n`;
    }

    fs.writeFileSync(readmePath, content);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});