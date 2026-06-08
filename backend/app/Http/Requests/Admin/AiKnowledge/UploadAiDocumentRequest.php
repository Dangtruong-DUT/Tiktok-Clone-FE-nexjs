<?php

namespace App\Http\Requests\Admin\AiKnowledge;

use App\Http\Requests\BaseRequest;

class UploadAiDocumentRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'file'        => [self::REQUIRED_WITHOUT . ':raw_content', self::FILE, self::MIMES . ':pdf,txt,docx,doc', self::MAX . ':10240'],
            'raw_content' => [self::REQUIRED_WITHOUT . ':file', self::STRING],
            'title'       => [self::REQUIRED, self::STRING, self::MAX . ':255'],
            'description' => [self::NULLABLE, self::STRING, self::MAX . ':500'],
            'source_type' => [self::REQUIRED, self::STRING, self::IN . ':faq,guide,policy,feature,other'],
            'language'    => [self::NULLABLE, self::STRING, self::MAX . ':10'],
        ]);
    }
}
