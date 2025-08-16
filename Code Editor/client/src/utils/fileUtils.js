// utils/fileUtils.js

export const boilerplateByExtension = {
  ".html": `<!DOCTYPE html>
<html>
  <head>
    <title>Document</title>
  </head>
  <body>
    <p>This is a HTML file</p>
  </body>
</html>`,
  ".css": `body { 
    font-family: Arial, sans-serif; 
}`,
  ".js": `console.log('Hello, JavaScript!');`,
  ".py": `print("Hello, Python!")`,
  ".java": `public class Main { 
  public static void main(String[] args) {
    System.out.println("Hello, Java!"); 
  }
}`,
  ".c": `#include <stdio.h>\nint main() {
  printf("Hello, C!\\n"); 
  return 0; 
}`,
  ".cpp": `#include <iostream>\nusing namespace std;
int main() {
  cout << "Hello, C++!" << endl;
  return 0;
}`
};

//  file structure
export const defaultWebStructure = [
  {
    id: "1",
    name: "index.html",
    type: "file",
    extension: ".html",
    content: boilerplateByExtension[".html"],
  },
  {
    id: "2",
    name: "style.css",
    type: "file",
    extension: ".css",
    content: boilerplateByExtension[".css"],
  },
  {
    id: "3",
    name: "script.js",
    type: "file",
    extension: ".js",
    content: boilerplateByExtension[".js"],
  }
];

export const defaultGeneralStructure = [
    {
    id: "4",
    name: "Default.c",
    type: "file",
    extension: ".c",
    content: boilerplateByExtension[".c"],
  },
  {
    id: "5",
    name: "Default.cpp",
    type: "file",
    extension: ".cpp",
    content: boilerplateByExtension[".cpp"],
  },
  {
    id: "6",
    name: "Default.py",
    type: "file",
    extension: ".py",
    content: boilerplateByExtension[".py"],
  },
  {
    id: "7",
    name: "Default.java",
    type: "file",
    extension: ".java",
    content: boilerplateByExtension[".java"],
  }
];