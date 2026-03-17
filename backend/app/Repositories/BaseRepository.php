<?php

namespace App\Repositories;

use App\Exceptions\http\NotFoundException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Base repository class providing common database operations.
 *
 * This abstract class implements basic CRUD and query operations
 * that can be used by all repository implementations.
 */
abstract class BaseRepository
{
    /**
     * Create a new repository instance.
     *
     * @param Model $model The model instance
     */
    public function __construct(protected Model $model)
    {
        // The model is injected via the constructor and stored as a protected property
    }

    /**
     * Get all records.
     *
     * @param  array      $columns The columns to retrieve
     * @return Collection Collection of all records
     */
    public function all($columns = ['*']): Collection
    {
        return $this->model->all($columns);
    }

    /**
     * Get paginated records.
     *
     * @param  int                  $perPage Number of items per page
     * @param  array                $columns The columns to retrieve
     * @return LengthAwarePaginator Paginated results
     */
    public function paginate(int $perPage = 15, $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->paginate($perPage, $columns);
    }

    /**
     * Find a record by its ID.
     *
     * @param  int   $id The ID to search for
     * @return Model|null The found model or null if not found
     */
    public function find(int $id): Model|null
    {
        return $this->model->find($id);
    }

    public function findByIds(array $ids): Collection
    {
        return $this->model->whereIn('id', $ids)->get();
    }

    /**
     * Find a record by its ID.
     *
     * @param  int               $id The ID to search for
     * @throws NotFoundException If model not found
     * @return Model             The found model
     */
    public function findOrFail(int $id): Model
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create a new record.
     *
     * @param  array $attributes The attributes for the new record
     * @return Model The created model
     */
    public function create(array $attributes): Model
    {
        return $this->model->create($attributes);
    }

    /**
     * Update an existing record.
     *
     * @param  int               $id         The ID of the record to update
     * @param  array             $attributes The attributes to update
     * @throws NotFoundException If model not found
     * @return Model             The updated model
     */
    public function update(int $id, array $attributes): Model
    {
        $record = $this->findOrFail($id);

        $record->update($attributes);

        return $record->refresh();
    }

    /**
     * Create a new record.
     *
     * @param  array $attributes The attributes for the new record
     * @return Model The created model
     */
    public function updateOrCreate(array $attributes, array $values): Model
    {
        return $this->model->updateOrCreate($attributes, $values);
    }

    /**
     * Update multiple records.
     *
     * @param  array             $ids        The IDs of the records to update
     * @param  array             $attributes The attributes to update
     * @return Collection        The updated models
     */
    public function updateMultiple(array $ids, array $attributes): Collection
    {
        $this->model->whereIn('id', $ids)->update($attributes);
        return $this->model->whereIn('id', $ids)->get();
    }

    /**
     * Delete a record.
     *
     * @param  int               $id The ID of the record to delete
     * @throws NotFoundException If model not found
     * @return bool              True if deletion successful, false otherwise
     */
    public function delete(int $id): bool
    {
        return $this->find($id)->delete();
    }

    /**
     * Find records matching given criteria.
     *
     * @param  array      $criteria The search criteria
     * @return Collection Collection of matching records
     */
    public function findWhere(array $criteria): Collection
    {
        return $this->model->where($criteria)->get();
    }

    /**
     * Find first record matching given criteria.
     *
     * @param  array      $criteria The search criteria
     * @return Model|null The found model or null if not found
     */
    public function findWhereFirst(array $criteria): ?Model
    {
        return $this->model->where($criteria)->first();
    }

    /**
     * Find first record matching given criteria or fail.
     *
     * @param  array             $criteria The search criteria
     * @throws NotFoundException If no matching record found
     * @return Model             The found model
     */
    public function findWhereFirstOrFail(array $criteria): Model
    {
        $record = $this->findWhereFirst($criteria);

        if (!$record instanceof Model) {
            throw new NotFoundException('Resource not found with given criteria');
        }

        return $record;
    }
}
