<?php

namespace App\Repositories;

use App\Exceptions\http\NotFoundException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @template TModel of Model
 */
abstract class BaseRepository
{
    /**
     * @param  TModel  $model
 */
    public function __construct(private readonly Model $model) {}

    /**
     * @return \Illuminate\Database\Eloquent\Builder<TModel>
 */
    public function query()
    {
        return $this->model->query();
    }

    /**
     * @param  array<int,string>  $columns
     * @return Collection<int, TModel>
 */
    public function all(array $columns = ['*']): Collection
    {
        return $this->model->all($columns);
    }

    /**
     * @param  array<int,string>  $columns
 */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->query()->paginate($perPage, $columns);
    }

    /**
     * @return TModel|null
 */
    public function find(int $id): ?Model
    {
        return $this->query()->find($id);
    }

    /**
     * @param  array<int,int>  $ids
     * @return Collection<int, TModel>
 */
    public function findByIds(array $ids): Collection
    {
        return $this->query()->whereIn('id', $ids)->get();
    }

    /**
     * @return TModel
 */
    public function findOrFail(int $id): Model
    {
        $record = $this->query()->find($id);

        if (! $record instanceof Model) {
            throw new NotFoundException('Resource not found');
        }

        return $record;
    }

    /**
     * @param  array<string,mixed>  $attributes
     * @return TModel
 */
    public function create(array $attributes): Model
    {
        return $this->query()->create($attributes);
    }

    /**
     * @param  array<string,mixed>  $attributes
     * @return TModel
 */
    public function update(int $id, array $attributes): Model
    {
        $record = $this->findOrFail($id);

        $record->update($attributes);

        return $record->refresh();
    }

    /**
     * @param  array<string,mixed>  $attributes
     * @param  array<string,mixed>  $values
     * @return TModel
 */
    public function updateOrCreate(array $attributes, array $values): Model
    {
        return $this->query()->updateOrCreate($attributes, $values);
    }

    /**
     * @param  array<int,int>  $ids
     * @param  array<string,mixed>  $attributes
     * @return Collection<int, TModel>
 */
    public function updateMultiple(array $ids, array $attributes): Collection
    {
        $this->query()->whereIn('id', $ids)->update($attributes);

        return $this->query()->whereIn('id', $ids)->get();
    }

    public function delete(int $id): bool
    {
        $record = $this->findOrFail($id);

        return (bool) $record->delete();
    }

    /**
     * @param  array<string,mixed>  $criteria
     * @return Collection<int, TModel>
 */
    public function findWhere(array $criteria): Collection
    {
        return $this->query()->where($criteria)->get();
    }

    /**
     * @param  array<string,mixed>  $criteria
     * @return TModel|null
 */
    public function findWhereFirst(array $criteria): ?Model
    {
        return $this->query()->where($criteria)->first();
    }

    /**
     * @param  array<string,mixed>  $criteria
     * @return TModel
 */
    public function findWhereFirstOrFail(array $criteria): Model
    {
        $record = $this->findWhereFirst($criteria);

        if (! $record instanceof Model) {
            throw new NotFoundException('Resource not found with given criteria');
        }

        return $record;
    }
}
