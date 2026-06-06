<?php

namespace App\Services\AI\Rag;

use Illuminate\Http\UploadedFile;
use RuntimeException;

class DocumentTextExtractorService
{
    public function extract(UploadedFile $file): string
    {
        return match (strtolower($file->getClientOriginalExtension())) {
            'pdf'        => $this->extractPdf($file->getPathname()),
            'docx', 'doc' => $this->extractDocx($file->getPathname()),
            default      => (string) file_get_contents($file->getPathname()),
        };
    }

    private function extractPdf(string $path): string
    {
        if (! class_exists(\Smalot\PdfParser\Parser::class)) {
            throw new RuntimeException('smalot/pdfparser is not installed. Run: composer require smalot/pdfparser');
        }

        $parser = new \Smalot\PdfParser\Parser();
        $pdf    = $parser->parseFile($path);

        return $pdf->getText();
    }

    private function extractDocx(string $path): string
    {
        if (! class_exists(\PhpOffice\PhpWord\IOFactory::class)) {
            throw new RuntimeException('phpoffice/phpword is not installed. Run: composer require phpoffice/phpword');
        }

        $phpWord  = \PhpOffice\PhpWord\IOFactory::load($path);
        $sections = $phpWord->getSections();
        $text     = [];

        foreach ($sections as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text[] = $element->getText();
                } elseif (method_exists($element, 'getElements')) {
                    foreach ($element->getElements() as $child) {
                        if (method_exists($child, 'getText')) {
                            $text[] = $child->getText();
                        }
                    }
                }
            }
        }

        return implode("\n", array_filter($text));
    }
}
