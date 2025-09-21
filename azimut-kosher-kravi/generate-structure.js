import fs from "fs";
import path from "path";

const baseDir = path.resolve("src");

const structure = {
  Pages: [
    "Home",
    "CreateWorkout",
    "Heritage",
    "MilitaryChat",
    "WorkoutHistory",
    "Settings",
    "AboutUs",
    "QuickWorkout",
    "SpecialWorkouts",
    "HeritageEntry",
    "WorkoutSetup",
    "Onboarding",
    "AssessmentWorkout",
    "SelectWorkout",
  ],
  Components: [
    "LanguageContext.tsx",
    "FormattedContent.tsx",
    { heritage: ["index.tsx"] },
    { workout: ["index.tsx"] },
  ],
  Entities: [
    "HeritageStory.tsx",
    "WorkoutHistory.tsx",
    "Warmup.tsx",
    "RunningEndurance.tsx",
    "StrengthExplosive.tsx",
    "Special.tsx",
  ],
  rootFiles: ["Layout.tsx", "App.tsx"],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("✅ Created:", filePath);
  }
}

// Pages
structure.Pages.forEach((page) => {
  const dir = path.join(baseDir, "Pages", page);
  ensureDir(dir);
  const file = path.join(dir, "index.tsx");
  writeFileIfNotExists(
    file,
    `export default function ${page}() {\n  return <div>${page} Page</div>;\n}\n`
  );
});

// Components
const compDir = path.join(baseDir, "Components");
ensureDir(compDir);

structure.Components.forEach((comp) => {
  if (typeof comp === "string") {
    const file = path.join(compDir, comp);
    const name = path.basename(comp, ".tsx");
    writeFileIfNotExists(
      file,
      `export default function ${name}() {\n  return <div>${name} Component</div>;\n}\n`
    );
  } else {
    const [folder, files] = Object.entries(comp)[0];
    const dir = path.join(compDir, folder);
    ensureDir(dir);
    files.forEach((f) => {
      const file = path.join(dir, f);
      writeFileIfNotExists(
        file,
        `export default function ${folder}() {\n  return <div>${folder} Component</div>;\n}\n`
      );
    });
  }
});

// Entities
const entDir = path.join(baseDir, "Entities");
ensureDir(entDir);

structure.Entities.forEach((entity) => {
  const file = path.join(entDir, entity);
  const name = path.basename(entity, ".tsx");
  writeFileIfNotExists(
    file,
    `export default function ${name}() {\n  return <div>${name} Entity</div>;\n}\n`
  );
});

// Root files
structure.rootFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  if (file === "Layout.tsx") {
    writeFileIfNotExists(
      filePath,
      `import { Outlet } from "react-router-dom";\n\nexport default function Layout() {\n  return (\n    <div>\n      <header>Header</header>\n      <main>\n        <Outlet />\n      </main>\n      <footer>Footer</footer>\n    </div>\n  );\n}\n`
    );
  } else if (file === "App.tsx") {
    writeFileIfNotExists(
      filePath,
      `import { createBrowserRouter, RouterProvider } from "react-router-dom";\nimport Layout from "./Layout";\n\n// TODO: import your Pages here\n\nconst router = createBrowserRouter([\n  {\n    path: "/",\n    element: <Layout />,\n    children: [\n      { index: true, element: <div>Home Page</div> },\n    ],\n  },\n]);\n\nexport default function App() {\n  return <RouterProvider router={router} />;\n}\n`
    );
  }
});
